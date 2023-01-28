import { Component, Input, OnInit } from '@angular/core';
import { PostCreateService } from '../post-create/post-create.service'
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { Post } from '../post.model';
import { AuthService } from 'src/app/auth/auth.service';



@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {
  posts: Post[] = []
  private _postSubscription!: Subscription;
  private authListenerSubs: Subscription
  userIsAuthenticated = false
  userId: string

  constructor(private postCreateService: PostCreateService, private authService: AuthService) { }

  ngOnInit(): void {
    this.postCreateService.getPosts()
    this.userId = this.authService.getUserId()
    this._postSubscription = this.postCreateService.getNewPost().subscribe((posts: Post[]) => {
      this.posts = posts
    })

    this.userIsAuthenticated = this.authService.getIsAuth()
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated
      this.userId = this.authService.getUserId()
    })
  }

  onEditClick() {
    console.log('edit clicked!')
  }

  onDeleteClick(postId: string) {
    this.postCreateService.deletePost(postId)
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this._postSubscription?.unsubscribe();
    this.authListenerSubs.unsubscribe()
  }

}
