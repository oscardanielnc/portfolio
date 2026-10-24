import { en } from '@/content/en';
import { SitePage } from '@/components/site-page';
import { stageAssets } from '@/lib/stage-assets';

export default function HomeEn() {
  return <SitePage content={en} model={stageAssets.model} stageScript={stageAssets.script} />;
}
