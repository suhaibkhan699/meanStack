import { Component, OnInit } from '@angular/core';
import { PostCreateService } from './post-create.service';
import { Post } from '../post.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { mimeType } from './mime-type.validator';


@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  post!: Post
  private mode: string = 'create'
  private postId!: string
  form: FormGroup
  imagePreview: string
  userId: string

  constructor(
    private postCreateService: PostCreateService,
    public route: ActivatedRoute) { }

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId')
    this.form = new FormGroup({
      'title': new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      'content': new FormControl(null, {
        validators: [Validators.required]
      }),
      'image': new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType] })
    })

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit'
        this.postId = paramMap.get('postId') || '';
        this.postCreateService.getPost(this.postId).
          subscribe(postData => {
            this.post = { id: postData.post._id, title: postData.post.title, content: postData.post.content, imagePath: postData.post.imagePath, creator: postData.post.creator }
            this.form.setValue({
              'title': this.post.title,
              'content': this.post.content,
              'image': this.post.imagePath
            })
          })
      }
      else {
        this.mode = 'create'
        this.postId = '';
      }
    })
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    if (this.mode === 'create') {
      const post: Post = { id: '', title: this.form.value.title, content: this.form.value.content, imagePath: this.form.value.image, creator: this.userId }
      this.postCreateService.addPost(post)
    }
    else {
      this.postCreateService.updatePost({ id: this.postId, title: this.form.value.title, content: this.form.value.content, imagePath: this.form.value.image, creator: this.userId })
    }
    this.form.reset()

  }

  getButtonName(): string {
    return this.mode === 'create' ? 'Submit' : 'Update'
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0]
    this.form.patchValue({ 'image': file })
    this.form.get('image').updateValueAndValidity()
    const reader = new FileReader()
    reader.onload = () => {
      this.imagePreview = reader.result as string
    }
    reader.readAsDataURL(file)
  }

}
