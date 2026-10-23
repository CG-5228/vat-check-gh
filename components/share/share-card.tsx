'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { Share2, Download, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { sourceDateLabel } from '@/lib/source';
export default function ShareCard({
  name,
  registered = true,
}: {
  name: string;
  registered?: boolean;
}) {
  const { t } = useLanguage();
  const [status, setStatus] = useState('');
  async function makeCard() {
    await document.fonts.ready;
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Image creation is unavailable in this browser.');
    ctx.fillStyle = '#f3f6ec';
    ctx.fillRect(0, 0, 1200, 630);
    ctx.fillStyle = '#174c3c';
    ctx.fillRect(0, 0, 1200, 12);
    ctx.fillStyle = '#eec96b';
    ctx.fillRect(0, 0, 190, 12);
    ctx.font = '600 30px "DM Sans",sans-serif';
    ctx.fillText('VAT Check GH', 65, 86);
    ctx.font = '500 56px "DM Sans",sans-serif';
    const display = name.length > 35 ? name.slice(0, 34) + '…' : name;
    ctx.fillText(display, 65, 187, 1070);
    ctx.font = '600 25px "DM Sans",sans-serif';
    ctx.fillText(
      registered ? '✓ On GRA’s registered merchant list' : 'Not on this GRA list',
      65,
      246,
    );
    ctx.font = '400 28px "DM Sans",sans-serif';
    const lines = registered
      ? [
          'Registration does not confirm whether tax is included.',
          'GRA says VAT is collected at payment.',
          'Check the receipt before querying an extra charge.',
        ]
      : [
          'Absence from this list does not mean tax-free.',
          'Your payment provider may collect VAT if it qualifies.',
        ];
    lines.forEach((line, i) => ctx.fillText(line, 65, 322 + i * 44));
    ctx.fillStyle = '#5d6d65';
    ctx.font = '400 19px "DM Sans",sans-serif';
    ctx.fillText(`Data as of ${sourceDateLabel} · GRA FAQ Q13–15, page 2`, 65, 526);
    ctx.fillText(
      'Not affiliated with GRA. Not tax or legal advice. Check official GRA guidance.',
      65,
      566,
    );
    return new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Could not create the share card.'))),
        'image/png',
      ),
    );
  }
  async function share() {
    try {
      const blob = await makeCard();
      const file = new File([blob], 'vat-check-gh-result.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: `${name} | VAT Check GH`, files: [file] });
        setStatus('Shared');
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vat-check-gh-result.png';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setStatus('Share card downloaded');
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      setStatus('Image sharing is unavailable. You can copy the page link.');
    }
  }
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="button button-light">
          <Share2 size={16} />
          {t.share}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title>Share a little clarity.</Dialog.Title>
          <Dialog.Description className="help">
            Create a private, local image of this result. Your entries are not sent anywhere.
          </Dialog.Description>
          <div className="share-preview">
            <span className="eyebrow">VAT CHECK GH</span>
            <strong>{name}</strong>
            <span className="status-badge">
              {registered ? '✓ On the GRA list' : 'Not on this GRA list'}
            </span>
            <p>
              {registered
                ? 'Registration does not confirm whether tax is included. GRA says VAT is collected at payment.'
                : 'Not on this list does not mean tax-free. Tax may be collected if the payment qualifies.'}
            </p>
            <small>Data as of {sourceDateLabel} · GRA FAQ Q13–15</small>
          </div>
          <button
            className="button"
            style={{ marginTop: 21 }}
            onClick={() => {
              void share();
            }}
          >
            <Download size={16} />
            Share or download image
          </button>
          <p role="status" className="copy-status">
            {status}
          </p>
          <Dialog.Close asChild>
            <button className="icon-button dialog-close" aria-label="Close share dialog">
              <X size={20} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
