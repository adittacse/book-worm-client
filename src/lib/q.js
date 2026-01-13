export function toQuery(params = {}) {
    const sp = new URLSearchParams();

    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null) {
            return;
        }

        if (Array.isArray(v)) {
            if (v.length) {
                sp.set(k, v.join(","));
            }
            return;
        }

        const s = String(v).trim();
        if (s) {
            sp.set(k, s);
        }
    });

    return sp.toString();
}
