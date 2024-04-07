import test from 'ava';
import { MboxStreamer, ParsedMail } from '../src/index.js';

test('parser class', async t => {
  const messages: ParsedMail[] = [];

  const mbs = new MboxStreamer();
  mbs.on('message', msg => {
    messages.push(msg);
  });
  await mbs.parse("./test/example.mbox")

  t.is(mbs.inProgress, 0);
  t.is(messages.length, mbs.total);
});
