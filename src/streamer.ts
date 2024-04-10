import fs from 'fs';
import { Readable } from 'stream';
import { ParsedMail, simpleParser } from 'mailparser';
import { TypedEmitter } from 'tiny-typed-emitter';
import { MboxTransformer } from './transformer.js';
import pWaitFor from 'p-wait-for';


interface MboxStreamerEvents {
  message: (message: ParsedMail, processed: number) => void;
  error: (err: any) => void;
  finish: (processed: number) => void;
}

export class MboxStreamer extends TypedEmitter<MboxStreamerEvents> {
  total = 0;
  inProgress = 0;

  constructor() {
    super();
  }

  async parse(input: fs.PathLike | Readable) {
    this.total = 0;
    this.inProgress = 0;
    
    const stream = input instanceof Readable ? input : fs.createReadStream(input);

    const transform = new MboxTransformer();
    const mbox = stream.pipe(transform);

    mbox.on('data', message => {
      // P-Queue allows us to  
      this.total++;
      this.inProgress++;
      simpleParser(message, { keepCidLinks: true }, (err, mail) => {
        if (err) {
          this.emit('error', err);
        } else {
          this.emit('message', mail, this.total);
        }
        this.inProgress--;
      });
    });

    return pWaitFor<number>(
      () => this.total > 0 && this.inProgress === 0,
    ).then(() => {
      this.emit('finish', this.total);
      return this.total;
    });
  }
}
