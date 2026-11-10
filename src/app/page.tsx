import { Workspace } from '@/components/workspace';
import { configured } from '@/lib/server/generate';
export const dynamic = 'force-dynamic';
export default function Page() { return <Workspace configured={configured()}/>; }
