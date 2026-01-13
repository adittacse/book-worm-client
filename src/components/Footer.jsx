export default function Footer() {
    return (
        <footer className="footer footer-center p-6 bg-base-100 border-t">
            <aside>
                <p className="opacity-70 text-sm">
                    © {new Date().getFullYear()} BookWorm — Personalized Book Recommendation & Reading Tracker
                </p>
            </aside>
        </footer>
    );
}
