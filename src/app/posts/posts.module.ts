import { NgModule } from "@angular/core";
import { PostListComponent } from "./post-list/post-list.component";
import { PostCreateComponent } from "./post-create/post-create.component";
import { ReactiveFormsModule } from "@angular/forms";
import { AppRoutingModule } from "../app-routing.module";
import { BrowserModule } from "@angular/platform-browser";

@NgModule({
  declarations: [
    PostCreateComponent, PostListComponent
  ],
  imports: [
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserModule
  ]
})
export class PostsModule {

}