import fs from "fs";
import path from "path";

export class FileService {
  #uploadsDir;

  constructor() {
    this.#uploadsDir = path.resolve("src/uploads");
  }

  delete(filename) {
    const filePath = path.join(this.#uploadsDir, filename);
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Failed to delete file ${filename}:`, err);
    });
  }

  buildUrl(filename) {
    return `/uploads/${filename}`;
  }
}
