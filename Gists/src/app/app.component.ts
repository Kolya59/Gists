import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Gist } from './models/gist';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private gist: Gist;
  private gitHubURL = 'https://api.github.com';
  private clientID = '7a3f63ef8ef5de99a305';

  clientToken: string;
  options: FormGroup;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private readonly fb: FormBuilder,
  ) {
    this.clientToken = localStorage.getItem('token');
    if (!this.clientToken) {
      this.clientToken = this.cookieService.get('token');
      localStorage.setItem('token', this.clientToken);
    }

    this.gist = new Gist();
    this.options = fb.group({
      id: this.fb.control(this.gist.id, Validators.required),
      filename: this.fb.control(this.gist.filename),
      content: this.fb.control(this.gist.content)
    });
  }

  ngOnInit(): void {
  }

  async get() {
    this.setValuesFromControls();
    try {
      const res = await this.http.get(
        `${this.gitHubURL}/gists/${this.gist.id}`,
      ).toPromise() as {files};
      of(res.files).pipe(
          take(1),
          map((next) => next[Object.keys(next)[0]])
      ).subscribe((next) => {
        this.gist.filename = next.filename;
        this.gist.content = next.content;
        this.getValueFromControls();
      });
    } catch (e) {
      // TODO Handle errors
      console.error('Failed to get gist', e);
    }
  }

  async create() {
    this.setValuesFromControls();
    try {
      const res = await this.http.post(
        `${this.gitHubURL}/gists`,
        `{"description":"New snippet","public":"true","files":{"${this.gist.filename}":{"content":"${this.gist.content}"}}}`
      ).toPromise();
      of(res).pipe(
        take(1)
      ).subscribe((next: {id: string}) => {
        this.gist.id = next.id;
        this.getValueFromControls();
      });
      alert('Gist saved');
    } catch (e) {
      console.error('Failed to create gist', e);
      alert('Failed to create gist');
    }
  }

  async save() {
    this.setValuesFromControls();
    try {
      const res = await this.http.patch(
        `${this.gitHubURL}/gists/${this.gist.id}`,
        `{"description":"New snippet","public":"true","files":{"${this.gist.filename}":{"content":"${this.gist.content}"}}}`
      ).toPromise();
      of(res).pipe(
        take(1)
      ).subscribe((next: {id: string}) => {
        this.gist.id = next.id;
        this.getValueFromControls();
      });
      alert('Gist updated');
    } catch (e) {
      console.error('Failed to update gist', e);
      alert('Failed to update gist');
    }
  }

  async delete() {
    this.setValuesFromControls();
    try {
      await this.http.delete(`${this.gitHubURL}/gists/${this.gist.id}`);
      alert('Gist deleted');
      this.gist = new Gist();
      this.getValueFromControls();
    } catch (e) {
      console.error('Failed to delete gist', e);
      alert('Failed to delete gist');
    }
  }

  isLogged(): boolean {
    return !!this.clientToken;
  }

  login() {
    window.location.href = 'https://github.com/login/oauth/authorize?' +
    'client_id=' + this.clientID + '&' +
    'scope=gist';
  }

  logout() {
    this.clientToken = '';
    localStorage.clear();
  }

  setValuesFromControls() {
    this.gist.id = this.options.controls.id.value;
    this.gist.filename = this.options.controls.filename.value;
    this.gist.content = this.options.controls.content.value;
  }

  getValueFromControls() {
    this.options.controls.id.setValue(this.gist.id);
    this.options.controls.filename.setValue(this.gist.filename);
    this.options.controls.content.setValue(this.gist.content);
  }
}
