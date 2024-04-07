# MBox Streamer

A streaming, event-emitting mbox file parser. Give it a stream (or a path-like pointer to an mbox file) — it will happily read through, firing off a 'message' event with a ParsedMail payload for each one it encounters.

## Installation

`npm i eaton/mbox-streamer`

## Usage

```typescript
import { MboxStreamer } from "./streamer.js";

const mbs = new MboxStreamer();
mbs.on('message', message => {
  console.log(`${message.date?.toISOString()}: ${message.subject}`);
});

await mbs.parse("./my-email-backup.mbox");
```

See the [mailparser](https://github.com/nodemailer/mailparser) project for details on the `ParsedMail` object that's generated.

The [mbox-to-json](https://github.com/d4data-official/mbox-to-json) project served as this one's original inspiration; rather than accumulating parsed messages and returning them at the end of the operation, however, we emit each one and let the listeners figure out what to keep or discard.

## TODOs

- [ ] Allow parsing options to be passed into the `parse()` function; the mailparser project has a few nice convenience flags that can speed up the work if (for example) you don't care about grabbing HTML versions of email bodies or extracting file attachments.
- [ ] Add a pure Transformer version for folks comfortable piping streams rather than using a wrapper class.
