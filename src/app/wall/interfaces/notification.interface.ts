export interface Notification {
  id: string,
  userId: string,
  type: NotificationType,
  readed: boolean,
  date: Date,
  generatedById: string,
  content: string
  deleted: boolean
}

export enum NotificationType {
  newPost = 'newPost',
  likedPost = 'likedPost',
  likedComment = 'likedComment',
  commentOn = 'commentOn',
  follow = 'follow',
}
