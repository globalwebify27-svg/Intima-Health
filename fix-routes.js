const fs = require('fs');

const filesToFix = [
  "src/app/api/admin/content/faqs/[id]/route.ts",
  "src/app/api/admin/content/pages/[id]/route.ts",
  "src/app/api/admin/content/posts/[id]/route.ts",
  "src/app/api/admin/store/products/[id]/route.ts",
  "src/app/api/public/content/pages/[slug]/route.ts",
  "src/app/api/public/store/products/[slug]/route.ts"
];

for (const file of filesToFix) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace { params }: { params: { id: string } } with { params }: { params: Promise<{ id: string }> }
  content = content.replace(/\{ params \}: \{ params: \{ id: string \} \}/g, "{ params }: { params: Promise<{ id: string }> }");
  content = content.replace(/\{ params \}: \{ params: \{ slug: string \} \}/g, "{ params }: { params: Promise<{ slug: string }> }");

  // In each function (PUT, DELETE, GET), we need to extract `id` or `slug` from `await params`
  // We can do this by replacing `params.id` with `(await params).id` and `params.slug` with `(await params).slug`
  content = content.replace(/params\.id/g, "(await params).id");
  content = content.replace(/params\.slug/g, "(await params).slug");

  fs.writeFileSync(file, content);
}
console.log("Fixed routes!");
