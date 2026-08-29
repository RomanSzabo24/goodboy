import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ContributeMessage } from "@/services/shelters";

type SuccessStepProps = {
  messages: ContributeMessage[];
  onDonateAgain: () => void;
};

export function SuccessStep({ messages, onDonateAgain }: SuccessStepProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <CheckCircle2 className="size-12 text-primary" aria-hidden="true" />
      <h2 className="text-lg font-semibold">Thank you for your donation!</h2>
      <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
        {messages.map((message, index) => (
          <li key={index}>{message.message}</li>
        ))}
      </ul>
      <Button type="button" onClick={onDonateAgain}>
        Make another donation
      </Button>
    </div>
  );
}
