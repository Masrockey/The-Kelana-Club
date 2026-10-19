import { ReactNode } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: 'destructive' | 'default';
    icon?: 'trash' | 'warning';
    onConfirm: () => void | Promise<void>;
    loading?: boolean;
}

export default function ConfirmDialog({
    open,
    onOpenChange,
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    variant = 'destructive',
    icon = 'trash',
    onConfirm,
    loading = false,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="gap-2 sm:text-left">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                variant === 'destructive'
                                    ? 'bg-red-500/10 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                    : 'bg-amber-500/10 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                            }`}
                        >
                            {icon === 'trash' ? (
                                <Trash2 className="h-5 w-5" />
                            ) : (
                                <AlertTriangle className="h-5 w-5" />
                            )}
                        </div>
                        <div>
                            <DialogTitle className="text-base font-semibold leading-none">
                                {title}
                            </DialogTitle>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Please confirm to proceed
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-2 text-sm text-muted-foreground">
                    {description}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="text-xs"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant={variant}
                        onClick={async () => {
                            await onConfirm();
                            onOpenChange(false);
                        }}
                        disabled={loading}
                        className="text-xs"
                    >
                        {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
