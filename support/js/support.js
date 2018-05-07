const crypto = require('crypto'),
    credential = {},
    algorithm = 'aes-128-cbc';

module.exports = {
    encrypt: (sid, pwd) => {
        if (!(sid in credential)) {
            credential[sid] = {};
            console.log('compute key and iv');
            let datetime = new Date();
                passphrase = datetime.getTime().toString();
            // console.log(passphrase);
            [key, iv] = compute(algorithm, passphrase);
            credential[sid].iv = iv.toString('hex').slice(0, 16);
            credential[sid].key = key.toString('hex').slice(0, 16);
            // console.log('key: ' + credential[sid].key);
            // console.log('iv: ' + credential[sid].iv);
        }
        // key = Buffer.from('5ebe2294ecd0e0f08eab7690d2a6ee69', 'hex');
        // iv  = Buffer.from('26ae5cc854e36b6bdfca366848dea6bb', 'hex');
        const cipher = crypto.createCipheriv(algorithm, credential[sid].key, credential[sid].iv);
        let crypted = cipher.update(pwd, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    },

    decrypt:(sid, pwd) => {
        var decipher = crypto.createDecipheriv(algorithm, credential[sid].key, credential[sid].iv);
        var dec = decipher.update(pwd,'hex','utf8')
        dec += decipher.final('utf8');
        return dec;
    },

    destroyCredential: (sid) => {
        console.log('destroy credential');
        if (sid in credential) {
            delete credential[sid];
        } else {
            console.log('destroyCredential error');
        }
    }
}

function sizes(cipher) {
  for (let nkey = 1, niv = 0;;) {
    try {
      crypto.createCipheriv(cipher, '.'.repeat(nkey), '.'.repeat(niv));
      return [nkey, niv];
    } catch (e) {
      if (/invalid iv length/i.test(e.message)) niv += 1;
      else if (/invalid key length/i.test(e.message)) nkey += 1;
      else throw e;
    }
  }
}

function compute(cipher, passphrase) {
  let [nkey, niv] = sizes(cipher);
  for (let key = '', iv = '', p = '';;) {
    const h = crypto.createHash('md5');
    h.update(p, 'hex');
    h.update(passphrase);
    p = h.digest('hex');
    let n, i = 0;
    n = Math.min(p.length-i, 2*nkey);
    nkey -= n/2, key += p.slice(i, i+n), i += n;
    n = Math.min(p.length-i, 2*niv);
    niv -= n/2, iv += p.slice(i, i+n), i += n;
    if (nkey+niv === 0) return [key, iv];
  }
}

