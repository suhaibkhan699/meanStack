import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Post } from '../post.model';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PostCreateService {
  private post$ = new BehaviorSubject<any>({})
  posts!: Post[]

  constructor(private http: HttpClient,
    private router: Router) { }

  getPosts() {
    this.http.get<{ message: string, posts: any }>('http://localhost:3000/api/posts')
      .pipe(map((postData) => {
        return postData.posts.map((post: any) => {
          return {
            id: post._id,
            title: post.title,
            content: post.content,
            imagePath: post.imagePath
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

    this.http.post<{ message: string, post: Post }>('http://localhost:3000/api/posts', postData)
      .pipe(map((response: any) => {
        return {
          id: response.post._id,
          title: response.post.title,
          content: response.post.content,
          imagePath: response.post.imagePath
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
    this.http.put(`http://localhost:3000/api/posts/${post.id}`, postData).
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
    this.http.delete(`http://localhost:3000/api/posts/${postId}`)
      .subscribe(() => {
        this.posts = this.posts.filter(post => post.id !== postId)
        this.post$.next([...this.posts])
      })
  }

  getNewPost(): Observable<Post[]> {
    return this.post$.asObservable()
  }

  getPost(id: string) {
    return this.http.get<{ post: { _id: string, title: string, content: string, imagePath: string } }>(`http://localhost:3000/api/posts/${id}`)
    // return { ...this.posts?.find(post => post.id === id) }
  }
}
