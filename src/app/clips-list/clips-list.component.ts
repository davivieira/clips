import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ClipService } from '../services/clip.service';

@Component({
  selector: 'app-clips-list',
  templateUrl: './clips-list.component.html',
  styleUrls: ['./clips-list.component.css'],
  providers: [DatePipe]
})
export class ClipsListComponent implements OnInit, OnDestroy {

  @Input()
  scrollable: boolean = true;

  constructor(public clipsService: ClipService) {
    this.clipsService.getClips();
  }
  
  ngOnInit(): void {
    if (this.scrollable) {
      window.addEventListener('scroll', this.handleScroll);
    }
  }
  
  handleScroll = () => {
    /**
     * Important properties for handling scroll events:
     * 
     * offsetHeight: Total height of the page
     * innerHeight The height of the non-visible part
     * scrollTop: The height of the visible part at the beginning, when the scroll if fully on the top
     * 
     * For calling a service when user reaches the bottom of the page we will do:
     * 
     * innerHeight + scrollTop === offsetHeight ?
     */
    const { scrollTop, offsetHeight } = document.documentElement;
    const { innerHeight } = window;

    const bottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight;

    if (bottomOfWindow) {
      this.clipsService.getClips();
    }
  }
  
  ngOnDestroy(): void {
    if (this.scrollable) {
      window.removeEventListener('scroll', this.handleScroll);
    }

    this.clipsService.pageClips = [];
  }
}
