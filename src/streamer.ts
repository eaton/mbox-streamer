import fs from 'fs';
import { Readable } from 'stream';
import { ParsedMail, simpleParser } from 'mailparser';
import { TypedEmitter } from 'tiny-typed-emitter';
import { MboxTransformer } from './transformer.js';

interface MboxStreamerEvents {
  message: (message: ParsedMail) => void;
  error: (err: any) => void;
  close: () => void;
}

export class MboxStreamer extends TypedEmitter<MboxStreamerEvents> {
  constructor() {
    super();
  }

  async parse(input: fs.PathLike | Readable, rejectOnError = false) {
    const stream = input instanceof Readable ? input : fs.createReadStream(input);

    return new Promise<undefined>((resolve, reject) => {
      const transform = new MboxTransformer();
      const mbox = stream.pipe(transform);

      mbox.on('data', message => {
        simpleParser(message, { keepCidLinks: true }, (err, mail) => {
          if (err) {
            if (rejectOnError) {
              reject(err);
            } else {
              this.emit('error', err);
            }
          } else {
            this.emit('message', mail);
          }
        });
      });

      mbox.on('close', () => {
        this.emit('close');
        resolve(undefined);
      });
    });
  }
}
