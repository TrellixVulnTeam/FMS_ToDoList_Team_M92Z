import { Component, DoCheck, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { AuthenticateService } from 'src/app/service/authentificate.service';
import { Category } from '../models/category.model';
import { Tasks } from '../models/tasks.model';

@Component({
  selector: 'app-user-tasks',
  templateUrl: './user-tasks.component.html',
  styleUrls: ['./user-tasks.component.css']
})
export class UserTasksComponent implements OnInit,DoCheck {

  categories: Category[] = [];
  tasks: Tasks[] = [];
  category: Category | undefined;
  task!: Tasks;
  error = null;
  modalAction = "";

  searchForm: FormGroup;
  myForm: FormGroup;
  newSearch = "";
  researchTasks: Tasks[] = [];
  name = ""
  // pagination
  pages: number = 1

  //modal add article
  displayStyle = "none";
  displayBlur = "blur(0)"
  display = false

  newTask = {
    id: 0,
    nameTask: "",
    dateTask: new Date(),
    description: "",
    checked: false,
    deleted: false,
    category: {} as Category
  };


  constructor(public apiService: ApiService, private router: Router, private authenticateService: AuthenticateService) {
    this.myForm = new FormGroup({
      nameTask: new FormControl(this.newTask.nameTask),
      dateTask: new FormControl(this.newTask.dateTask),
      description: new FormControl(this.newTask.description),
      checked: new FormControl(this.newTask.checked),
      deleted: new FormControl(this.newTask.deleted),
      category: new FormControl(this.newTask.category),
    });
    this.searchForm = new FormGroup({
      newSearch: new FormControl(this.newSearch),

    });
  }
  ngDoCheck(): void {
    this.isAuthenticated()
  }


  ngOnInit(): void {
    // console.log(this.categories + "-----------------------------" + this.tasks);
    this.getAllTasks();
    this.getAllCategories();
    this.isAuthenticated()
    this.showName()
    //console.log(this.categories + "+++++++++++++++++++++++++++++++" + this.tasks);
  }


  getAllTasks() {
    this.apiService.getUserTasks().subscribe({
      next: (data) => (this.tasks = data
        //console.log("-------->" + data), this.tasks.forEach(t => console.log(t))
      ),
      error: (err) => (this.error = err.message),
      complete: () => (this.error = null),
    });
  }

  getAllCategories() {
    this.apiService.getCategories().subscribe({
      next: (data) => (this.categories = data
        // console.log("-------->" + data, this.categories.forEach(c => console.log(c)))
      ),
      error: (err) => (this.error = err.message),
      complete: () => (this.error = null),
    });
  }

  createPopup() {
    this.modalAction = "C";
    this.displayStyle = "block";
    this.displayBlur = "blur(4px)";
  }

  editPopup(t: Tasks) {
    this.modalAction = "E";
    this.displayStyle = "block";
    this.displayBlur = "blur(4px)";
    this.task = t
  }

  closePopup() {
    this.displayStyle = "none";
    this.displayBlur = "blur(0)"
    setTimeout(() => {
      this.ngOnInit()
    }, 1500)
    location.reload();
  }

  getTargetTask() {
    return this.task;
  }

  // delete task
  delTask(task: Tasks) {
    if (confirm("Vous êtes sur de vouloir supprimer cette tache?")) {
      this.apiService.delTask(task)
        .subscribe({
          //next: (data) => console.log(data),
          error: (err) => this.error = err.message,
          complete: () => this.getAllTasks()
        })
    }
  }

  onSearch(form: FormGroup) {
    //console.log(form.value);
    this.apiService.getTasksBySearch(form.value.newSearch).subscribe({
      next: (data) => (this.tasks = data,
        console.log("++++++++++" + data),
        this.tasks.forEach(t => console.log(t)
        )),
      error: (err) => (this.error = err.message),
      complete: () => (this.error = null),
    });


  }

  getTasksByCategory(catId: number) {
    //console.log("clic");
   
    this.apiService.getUserTasksByCatId(catId).subscribe({
      next: (data) => this.tasks = data,
      error: (err) => this.error = err.message,
      complete: () => this.error = null
    })
    this.pages = 1
  }


  // token ou pas (si pas token redirect not found)
  isAuthenticated() {
    let rep = this.authenticateService.getToken()
    if (rep == null) {
     this.router.navigateByUrl('403')
    }
  }
  showName() {
    let rep = this.authenticateService.getUserFromStorage()
    if (rep != null) {
      this.name = rep.username
    }
  }
}





