import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { PostDetailComponent } from './components/post-detail/post-detail.component';
import { CreatePostComponent } from './components/create-post/create-post.component';
import { SubredditListComponent } from './components/subreddit-list/subreddit-list.component';
import { CreateSubredditComponent } from './components/create-subreddit/create-subreddit.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'posts/create', component: CreatePostComponent },
  { path: 'posts/:id', component: PostDetailComponent },
  { path: 'subreddits', component: SubredditListComponent },
  { path: 'subreddits/create', component: CreateSubredditComponent },
  { path: 'r/:id', component: HomeComponent },
  { path: '**', redirectTo: '' }
];
