<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommentController extends Controller
{
    /**
     * Display comments moderation list.
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status');

        $comments = Comment::with('post:id,title,slug')
            ->when($status, function ($q) use ($status) {
                $q->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/comments/index', [
            'comments' => $comments,
            'currentStatus' => $status,
        ]);
    }

    /**
     * Update comment status (approve or mark as spam).
     */
    public function updateStatus(Request $request, Comment $comment): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,pending,spam',
        ]);

        $comment->update(['status' => $validated['status']]);

        return back()->with('success', "Comment marked as {$validated['status']}.");
    }

    /**
     * Delete comment.
     */
    public function destroy(Comment $comment): RedirectResponse
    {
        $comment->delete();

        return back()->with('success', 'Comment deleted.');
    }
}
