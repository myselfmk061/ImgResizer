'use client';

import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { submitFeedback } from '@/app/actions';

export function FeedbackDialog() {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    
    setIsSubmitting(true);
    try {
      await submitFeedback(feedback);
      toast({ title: 'Feedback sent!', description: 'Thank you for your feedback.' });
      setFeedback('');
      setIsOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send feedback. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquare className="h-4 w-4 mr-2" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Share your thoughts, report bugs, or suggest improvements..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          />
          <Button onClick={handleSubmit} disabled={!feedback.trim() || isSubmitting} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Sending...' : 'Send Feedback'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}