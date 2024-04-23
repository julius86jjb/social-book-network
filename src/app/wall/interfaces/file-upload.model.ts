


export interface IFileUpload {
  file: File;
  url: string;
}

export class FileUpload implements IFileUpload{
  url!: string;
  file: File;

  constructor(file: File) {
    this.file = file;
  }
}
