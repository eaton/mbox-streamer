import { Transform, TransformCallback } from "stream";

export class MboxTransformer extends Transform {
  private remaining: string;
  private bytes = 0;

  constructor() {
    super({
      readableObjectMode: true,
      writableObjectMode: false,
      encoding: 'binary',
    });
    this.remaining = '';
  }

  _transform(chunk: Buffer, encoding: string, callback: TransformCallback) {
    const data = `${this.remaining}${chunk.toString()}`;
    this.remaining = '';
    this.bytes += chunk.byteLength;
    const mails = data.split(/^From /m).filter((mail) => mail.length).map((mail) => {
      return `From ${mail}`
    });
    this.remaining = mails.pop() ?? '';
    if (mails.length > 0) {
      for (const mail of mails) {
        this.emit('data', mail, this.bytes);
      }
    }
    callback();
  };

  _flush(callback: TransformCallback) {
    if (this.remaining.length) {
      this.emit('data', this.remaining, this.bytes)
      this.remaining = '';
      callback();
      this.emit('close');
    }
  }
}
