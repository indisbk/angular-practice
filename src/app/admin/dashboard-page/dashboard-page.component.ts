import {Component, OnDestroy, OnInit} from '@angular/core';
import {PostsService} from '../../shared/services/posts.service';
import {Post} from '../../shared/interfaces';
import {Subscription} from 'rxjs';
import {AlertService} from '../shared/services/alert.service';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit, OnDestroy {

  posts: Post[] = [];
  searchStr: '';

  // Variable for subscription(get all posts)
  // pretend from memory leaks
  getAllSub: Subscription;

  // Variable for subscription(delete post)
  // pretend from memory leaks
  delSub: Subscription;

  constructor(
    private postsService: PostsService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.getAllSub = this.postsService.getAllPosts().subscribe(posts => {
      this.posts = posts;
    });
  }

  ngOnDestroy(): void {
    if (this.getAllSub) {
      this.getAllSub.unsubscribe();
    }
    if (this.delSub) {
      this.delSub.unsubscribe();
    }
  }

  removePost(id: string): void {
    this.delSub = this.postsService.delete(id).subscribe(() => {
      this.posts = this.posts.filter(post => post.id !== id);
      this.alertService.warning('The post was deleted');
    });
  }
}
