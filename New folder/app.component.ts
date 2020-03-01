import { Component, OnInit } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Gist } from './models/gist';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { filterErrorsAndWarnings } from '@angular/compiler-cli';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private gist: Gist;
  private gitHubURL = 'https://api.github.com';
  private clientToken: string;
  private options: FormGroup;
  private clientID = '7a3f63ef8ef5de99a305';

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
        `${this.gitHubURL}/gists/${this.gist.id}?authorization:${this.clientToken}`
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
        `${this.gitHubURL}/gists?authorization:${this.clientToken}`,
        `{description:'New snippet',public:'true',files:{${this.gist.filename}:{content:${this.gist.content}}}}`,
      );
      of(res).pipe(
        take(1)
      ).subscribe((next) => console.log(next));
      console.log('Gist saved');
    } catch (e) {
      // TODO Handle errors
      console.error('Failed to create gist', e);
    }
  }

  async save() {
    this.http.patch(
      `${this.gitHubURL}/gists/${this.gist.id}`,
      `{description:'New snippet',files:{${this.gist.filename}:{content:${this.gist.content}}}}`,
      {
        headers: {
          Authorization: `token ${this.clientToken}`
        }
      }
    ).toPromise()
      .then((r) => {
        alert(`Response: ${JSON.stringify(r)}`);
      })
      .catch((e) => {
        console.error('Error while sending post request', e);
      });
  }

  async delete() {
    this.http.delete(
      `${this.gitHubURL}/gists/${this.gist.id}`,
      {
        headers: {
          Authorization: `token ${this.clientToken}`
        }
      }
    ).toPromise()
      .then((r) => {
        alert(`Response: ${JSON.stringify(r)}`);
      })
      .catch((e) => {
        console.error('Error while sending delete request', e);
      });
  }

  isLogged(): boolean {
    return !!this.clientToken;
  }

  login() {
    window.location.href = 'https://github.com/login/oauth/authorize?' +
    'client_id=' + this.clientID + '&' +
    'scope=gists';
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
