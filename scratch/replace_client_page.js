const fs = require('fs');

let content = fs.readFileSync('src/app/(public)/treatments/[slug]/ClientPage.tsx', 'utf8');

// Replace export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) { ...
const match = /export default function ServiceDetailPage\(\{ params \}: \{ params: Promise<\{ slug: string \}> \}\) \{([\s\S]*?)const data = serviceDataMap\[resolvedParams\.slug\];([\s\S]*?)if \(\!data\) \{([\s\S]*?)\}/;

content = content.replace(match, `import * as Icons from "lucide-react";

export default function ClientPage({ data }: { data: any }) {
`);

// Also remove serviceDataMap and ServiceDetails definition
const mapMatch = /interface ServiceDetails \{([\s\S]*?)const serviceDataMap: Record<string, ServiceDetails> = \{([\s\S]*?)\};\n\n/m;
content = content.replace(mapMatch, '');

// Also fix icon rendering
// From: <cause.icon className="w-6 h-6" />
// To: {(() => { const Icon = Icons[cause.icon] || Icons.HelpCircle; return <Icon className="w-6 h-6" />; })()}
content = content.replace(/<cause\.icon className="w-6 h-6" \/>/g, `{(() => { const Icon = (Icons as any)[cause.icon] || Icons.HelpCircle; return <Icon className="w-6 h-6" />; })()}`);

// Also we need to remove `const resolvedParams = use(params);` which we replaced
content = content.replace(/import \{ use \} from "react";\n/g, '');

fs.writeFileSync('src/app/(public)/treatments/[slug]/ClientPage.tsx', content);
