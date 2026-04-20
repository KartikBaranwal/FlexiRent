const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Fix badly formatted template strings first
  const badTemplate1 = /\$\{(?:BASE_URL)?\}fetch\(`\$\{\s*process\.env\.NEXT_PUBLIC_API_URL\s*\}\\?\/api\\?\/products`\)/g;
  if (badTemplate1.test(content)) {
    content = content.replace(badTemplate1, '`${process.env.NEXT_PUBLIC_API_URL}/api/products`');
    changed = true;
  }
  const badTemplate2 = /\$\{(?:BASE_URL)?\}fetch\(`\$\{\s*process\.env\.NEXT_PUBLIC_API_URL\s*\}\s*\\?\/api\\?\/products`\)\?category=\$\{categoryFilter\}/g;
  if (badTemplate2.test(content)) {
    content = content.replace(badTemplate2, '`${process.env.NEXT_PUBLIC_API_URL}/api/products?category=${categoryFilter}`');
    changed = true;
  }
  const badTemplate3 = /fetch\(`fetch\(`\$\{\s*process\.env\.NEXT_PUBLIC_API_URL\s*\}\s*\/\s*api\s*\/\s*products`\)\/\$\{params\.id\}`\)/g;
  if (badTemplate3.test(content)) {
    content = content.replace(badTemplate3, 'fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${params.id}`)');
    changed = true;
  }
  const badTemplate4 = /'fetch\(`\$\{process\.env\.NEXT_PUBLIC_API_URL\}\/api\/products`\)'/g;
  if (badTemplate4.test(content)) {
    content = content.replace(badTemplate4, '`${process.env.NEXT_PUBLIC_API_URL}/api/products`');
    changed = true;
  }

  // Same logic to replace standard fetch('/api/...') -> fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/...`)
  const fetchSingleQuote = /fetch\('\/api\/(.*?)'/g;
  if (fetchSingleQuote.test(content)) {
    content = content.replace(fetchSingleQuote, 'fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/$1`');
    changed = true;
  }

  const fetchDoubleQuote = /fetch\("\/api\/(.*?)"/g;
  if (fetchDoubleQuote.test(content)) {
    content = content.replace(fetchDoubleQuote, 'fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/$1`');
    changed = true;
  }

  const fetchTick = /fetch\(`\/api\/(.*?)`/g;
  if (fetchTick.test(content)) {
    content = content.replace(fetchTick, 'fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/$1`');
    changed = true;
  }

  // AuthModal string replacements
  if (content.includes("authModalMode === 'signup' ? '/api/auth/register' : '/api/auth/login'")) {
     content = content.replace("'/api/auth/register'", '`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`');
     content = content.replace("'/api/auth/login'", '`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`');
     changed = true;
  }

  // products admin
  if (content.includes("editProduct ? `/api/admin/products/${editProduct._id}` : '/api/admin/products'")) {
     content = content.replace("`/api/admin/products/${editProduct._id}`", '`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${editProduct._id}`');
     content = content.replace("'/api/admin/products'", '`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`');
     changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

console.log("Done");
