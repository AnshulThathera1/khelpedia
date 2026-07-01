'use client';
import { useEffect } from 'react';

export default function ViewTracker({ slug }) {
    useEffect(() => {
        if (!slug) return;
        
        // Prevent double counting in dev strict mode or on refresh within same session
        const hasViewed = sessionStorage.getItem(`viewed_${slug}`);
        if (hasViewed) return;
        
        fetch(`/api/blogs/view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ slug }),
        }).then(res => {
            if (res.ok) {
                sessionStorage.setItem(`viewed_${slug}`, 'true');
            }
        }).catch(err => console.error("Error tracking view:", err));
        
    }, [slug]);

    return null;
}
