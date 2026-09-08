import { Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { downloadQuotePdf, quoteDocumentHtml } from "@/lib/quote-doc";
import { formatDate, type Quote } from "@/lib/data";

export function QuotePreviewDialog({
  quote,
  onOpenChange,
}: {
  quote: Quote | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!quote} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(96vw,900px)] max-w-none overflow-hidden p-0">
        {quote && (
          <>
            <DialogHeader className="border-b border-border p-5">
              <DialogTitle>Aperçu du devis {quote.id}</DialogTitle>
              <DialogDescription>
                {quote.company} · valable jusqu'au {formatDate(quote.validUntil)}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[62vh] overflow-auto bg-muted/40 p-4">
              <iframe
                title={`Devis ${quote.id}`}
                srcDoc={quoteDocumentHtml(quote)}
                className="h-[70vh] w-full rounded-lg border border-border bg-white shadow-sm"
              />
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-border p-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fermer
              </Button>
              <Button
                className="gradient-primary text-primary-foreground"
                onClick={() => {
                  const ok = downloadQuotePdf(quote);
                  if (ok) toast.success("Devis prêt", { description: "Choisissez « Enregistrer en PDF » dans la fenêtre d'impression." });
                  else toast.error("Autorisez les fenêtres pop-up pour télécharger le devis.");
                }}
              >
                <Download className="mr-2 h-4 w-4" /> Télécharger en PDF
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function QuoteDownloadButton({ quote, size = "sm" }: { quote: Quote; size?: "sm" | "default" }) {
  return (
    <Button
      size={size}
      variant="outline"
      onClick={() => {
        const ok = downloadQuotePdf(quote);
        if (!ok) toast.error("Autorisez les fenêtres pop-up pour télécharger le devis.");
      }}
    >
      <Printer className="mr-2 h-4 w-4" /> Télécharger PDF
    </Button>
  );
}
