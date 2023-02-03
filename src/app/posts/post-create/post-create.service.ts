import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Post } from '../post.model';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

const BACKEND_URL = `${environment.apiUrl}/posts`

@Injectable({
  providedIn: 'root'
})
export class PostCreateService {
  private post$ = new BehaviorSubject<any>({})
  posts!: Post[]

  constructor(private http: HttpClient,
    private router: Router) { }

  getPosts() {
    this.http.get<{ message: string, posts: any }>(`${BACKEND_URL}`)
      .pipe(map((postData) => {
        return postData.posts.map((post: any) => {
          return {
            id: post._id,
            title: post.title,
            content: post.content,
            imagePath: post.imagePath,
            creator: post.creator
          }
        })
      }))
      .subscribe((posts: Post[]) => {
        this.posts = [...posts]
        this.post$.next([...this.posts])
      })
  }

  addPost(post: Post) {
    const postData = new FormData()
    postData.append('title', post.title)
    postData.append('content', post.content)
    postData.append('image', post.imagePath, post.title)

    this.http.post<{ message: string, post: Post }>(`${BACKEND_URL}`, postData)
      .pipe(map((response: any) => {
        return {
          id: response.post._id,
          title: response.post.title,
          content: response.post.content,
          imagePath: response.post.imagePath,
          creator: response.post.creator
        }
      }))
      .subscribe((post) => {
        this.posts.push(post)
        this.post$.next([...this.posts])
        this.router.navigate(['/'])
      })
  }

  updatePost(post: Post) {
    let postData
    if (typeof (post.imagePath) === 'object') {
      postData = new FormData()
      postData.append('id', post.id)
      postData.append('title', post.title)
      postData.append('content', post.content)
      postData.append('image', post.imagePath, post.title)
    }
    else {
      postData = {
        id: post.id,
        title: post.title,
        content: post.content,
        imagePath: post.imagePath
      }
    }
    this.http.put(`${BACKEND_URL}/${post.id}`, postData).
      subscribe((res) => {
        const updatedPosts = [...this.posts]
        const oldPostIndex = updatedPosts.findIndex(p => p.id === postData.id)
        updatedPosts[oldPostIndex] = post
        this.posts = updatedPosts
        this.post$.next([...this.posts])
        this.router.navigate(['/'])
      })
  }

  deletePost(postId: string) {
    this.http.delete(`${BACKEND_URL}/${postId}`)
      .subscribe(() => {
        this.posts = this.posts.filter(post => post.id !== postId)
        this.post$.next([...this.posts])
      })
  }

  getNewPost(): Observable<Post[]> {
    return this.post$.asObservable()
  }

  getPost(id: string) {
    return this.http.get<{ post: { _id: string, title: string, content: string, imagePath: string, creator: string } }>(`${BACKEND_URL}/${id}`)
  }
}
