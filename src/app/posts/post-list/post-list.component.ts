import { Component, Input, OnInit } from '@angular/core';
import { PostCreateService } from '../post-create/post-create.service'
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { Post } from '../post.model';



@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {
  posts: Post[] = []
  private _postSubscription!: Subscription;


  constructor(private postCreateService: PostCreateService) { }

  ngOnInit(): void {
    this.postCreateService.getPosts()
    this._postSubscription = this.postCreateService.getNewPost().subscribe((posts: Post[]) => {
      this.posts = posts
    })
  }

  onEditClick(){
    console.log('edit clicked!')
  }

  onDeleteClick(postId: string){
    this.postCreateService.deletePost(postId)
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this._postSubscription?.unsubscribe();
  }

}
