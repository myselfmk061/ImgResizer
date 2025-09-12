'use client';

import { useState } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export function FeedbackDialog() {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast({ 
        title: 'Empty Feedback', 
        description: 'Please enter your feedback before sending.', 
        variant: 'destructive' 
      });
      return;
    }
    
    if (feedback.trim().length > 1000) {
      toast({ 
        title: 'Feedback Too Long', 
        description: 'Please keep feedback under 1000 characters.', 
        variant: 'destructive' 
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('message', feedback.trim());
      formData.append('subject', 'SnapScale Feedback');
      formData.append('timestamp', new Date().toISOString());
      
      const response = await fetch('https://formsubmit.co/myselfmkapps@gmail.com', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        toast({ 
          title: 'Feedback Sent!', 
          description: 'Thank you for your valuable feedback.' 
        });
        setFeedback('');
        setIsOpen(false);
      } else {
        throw new Error('Failed to send feedback');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to send feedback. Please try again later.', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          size="icon"
          className="rounded-full shadow-lg w-14 h-14 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Provide Feedback</DialogTitle>
          <DialogDescription>
            We'd love to hear your thoughts! Report a bug, suggest a feature, or just say hello.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Share your thoughts..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              disabled={isSubmitting}
              maxLength={1000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {feedback.length}/1000 characters
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!feedback.trim() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Feedback
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    