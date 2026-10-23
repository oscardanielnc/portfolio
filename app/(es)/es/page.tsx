import { es } from '@/content/es';
import { SitePage } from '@/components/site-page';
import { stageAssets } from '@/lib/stage-assets';

export default function HomeEs() {
  return <SitePage content={es} model={stageAssets.model} stageScript={stageAssets.script} />;
}
