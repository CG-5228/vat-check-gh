'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useLanguage, TranslatedText } from '@/lib/i18n';
import { sourceDateLabel } from '@/lib/source';
export default function ShareCard({
  name,
  registered = true,
}: {
  name: string;
  registered?: boolean;
}) {
  const { locale } = useLanguage();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  async function makeCard() {
    await document.fonts.ready;
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Image creation is unavailable.');
    ctx.fillStyle = '#F7F5F0';
    ctx.fillRect(0, 0, 1200, 960);
    ctx.fillStyle = '#1A1A1A';
    ctx.font = '600 32px "Instrument Sans",sans-serif';
    ctx.fillText('VAT Check GH', 64, 80);
    ctx.font = '600 48px "Instrument Sans",sans-serif';
    ctx.fillText(name.length > 38 ? name.slice(0, 37) + '…' : name, 64, 176, 1072);
    ctx.font = '400 28px "Instrument Sans",sans-serif';
    ctx.fillText(
      registered ? 'On GRA’s registered merchant list' : 'Not on this GRA list',
      64,
      232,
    );
    const lines = registered
      ? [
          'Registration does not confirm that tax is included.',
          'GRA says VAT is collected at payment.',
        ]
      : [
          'Absence from this list does not mean tax-free.',
          'Your provider may collect VAT if the payment qualifies.',
        ];
    lines.forEach((line, i) => ctx.fillText(line, 64, 296 + i * 40));
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(64, 480);
    ctx.lineTo(1136, 480);
    ctx.stroke();
    ctx.font = '400 24px "Instrument Sans",sans-serif';
    const rows = [
      ['Example price before tax', 'GH₵100.00'],
      ['VAT 15%', 'GH₵15.00'],
      ['NHIL 2.5%', 'GH₵2.50'],
      ['GETFund 2.5%', 'GH₵2.50'],
    ];
    rows.forEach(([label, value], i) => {
      ctx.textAlign = 'left';
      ctx.fillText(label ?? '', 64, 528 + i * 48);
      ctx.textAlign = 'right';
      ctx.fillText(value ?? '', 1136, 528 + i * 48);
    });
    ctx.textAlign = 'left';
    ctx.font = '400 56px "Instrument Sans",sans-serif';
    ctx.fillText('GH₵120.00', 64, 440);
    ctx.font = '400 22px "Instrument Sans",sans-serif';
    ctx.fillText(`Data as of ${sourceDateLabel}. GRA FAQ Q9, Q13–15.`, 64, 760);
    ctx.fillText('Not affiliated with GRA. Not tax or legal advice.', 64, 808);
    ctx.fillText('Check official GRA guidance.', 64, 848);
    ctx.fillText('Rates and base: gra.gov.gh/domestic-tax/tax-types/vat/', 64, 888);
    return new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Could not create the share card.'))),
        'image/png',
      ),
    );
  }
  async function share() {
    setLoading(true);
    setStatus('Preparing image…');
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
      if (e instanceof Error && e.name === 'AbortError') setStatus('Sharing cancelled.');
      else setStatus('The image could not be created. You can copy the page link instead.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="button button-light" lang={locale}>
          <TranslatedText id="share" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title>Share this result</Dialog.Title>
          <Dialog.Description className="help">
            The image is created on this device. Nothing is sent by this site.
          </Dialog.Description>
          <div className="share-preview">
            <strong>{name}</strong>
            <p>
              {registered
                ? 'On the GRA registered merchant list. Registration does not confirm that tax is included.'
                : 'Not on this GRA list. This does not mean tax-free.'}
            </p>
            <p>Example: GH₵100.00 before tax, plus 20%, gives GH₵120.00.</p>
            <small>Data as of {sourceDateLabel}. GRA FAQ Q9 and Q13–15.</small>
          </div>
          <button
            className="button button-light"
            disabled={loading}
            onClick={() => {
              void share();
            }}
          >
            Share or download image
          </button>
          <p role="status" className="copy-status">
            {status}
          </p>
          <Dialog.Close asChild>
            <button className="text-button dialog-close">Close share dialog</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
