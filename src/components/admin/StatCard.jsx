export default function StatCard({ title, value, hint }) {
    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body">
                <p className="text-sm opacity-70">{title}</p>
                <p className="text-3xl font-bold mt-1">{value ?? 0}</p>
                {
                    hint ? <p className="text-xs opacity-60 mt-2">{hint}</p> : null
                }
            </div>
        </div>
    );
}
