/**
 * Mock Supabase Client
 * Simulates a PostgreSQL database interaction via localStorage
 */
class MockSupabase {
    constructor() {
        this.auth = new MockAuth(this);
        this.storageKey = 'supabase_db_v1';
        this.db = this._loadDB();
    }

    _loadDB() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) return JSON.parse(stored);

        // Initial Seed
        return {
            users: [],
            leads: [], // { id, user_id, team_id, company_name, cnpj, sector, score, data, created_at }
            user_settings: [], // { user_id, ai_context, subscription_tier }
            teams: []
        };
    }

    _saveDB() {
        console.log("Saving DB to LocalStorage:", this.db);
        console.log("Saving DB to LocalStorage:", this.db);
        // Force synchronous save for test stability in mock environment
        localStorage.setItem(this.storageKey, JSON.stringify(this.db));
    }

    from(table) {
        return new QueryBuilder(table, this);
    }
}

class MockAuth {
    constructor(client) {
        this.client = client;
        this.currentUser = null;
        this.session = null;
    }

    async getSession() {
        const storedSession = sessionStorage.getItem('sb_session');
        if (storedSession) {
            this.session = JSON.parse(storedSession);
            this.currentUser = this.session.user;
            return { data: { session: this.session }, error: null };
        }
        return { data: { session: null }, error: null };
    }

    async signInWithPassword({ email, password }) {
        // Mock Login Logic
        const mockUser = {
            id: 'user_' + crypto.randomUUID().split('-')[0],
            email: email,
            role: email.includes('admin') ? 'admin' : 'authenticated',
            app_metadata: { provider: 'email' }
        };

        // Ensure user exists in DB or create
        let dbUser = this.client.db.users.find(u => u.email === email);
        if (!dbUser) {
            dbUser = { ...mockUser, created_at: new Date().toISOString() };
            this.client.db.users.push(dbUser);

            // Create default settings
            this.client.db.user_settings.push({
                user_id: dbUser.id,
                ai_context: "Foco em empresas de tecnologia B2B.",
                subscription_tier: 'pro',
                stripe_status: 'active' // Item 18
            });
            this.client._saveDB();
        }

        this.currentUser = dbUser;
        this.session = { access_token: 'mock_jwt_' + Date.now(), user: dbUser };
        sessionStorage.setItem('sb_session', JSON.stringify(this.session));

        return { data: { user: dbUser, session: this.session }, error: null };
    }

    async signOut() {
        this.currentUser = null;
        this.session = null;
        sessionStorage.removeItem('sb_session');
        return { error: null };
    }
}

class QueryBuilder {
    constructor(table, client) {
        this.table = table;
        this.client = client;
        this.filters = [];
        this.orders = [];
        this.limitVal = null;
    }

    select(columns = '*') {
        // In mock, we usually return all, but logic could parse columns
        return this;
    }

    eq(column, value) {
        this.filters.push(row => row[column] === value);
        return this;
    }

    gt(column, value) {
        this.filters.push(row => row[column] > value);
        return this;
    }

    ilike(column, pattern) {
        // Simple regex for %pattern%
        const regex = new RegExp(pattern.replace(/%/g, '.*'), 'i');
        // Handle JSONB deep search if column contains dots (e.g. data.sector)
        if(column.includes('.')) {
             const parts = column.split('.');
             this.filters.push(row => {
                 let val = row;
                 for(const p of parts) val = val?.[p];
                 return regex.test(val);
             });
        } else {
            this.filters.push(row => regex.test(row[column]));
        }
        return this;
    }

    // Item 7: Server-Side Search Logic (Simulated)
    textSearch(query) {
        // Full text search simulation across key fields
        const regex = new RegExp(query, 'i');
        this.filters.push(row => {
            return regex.test(row.company_name) ||
                   regex.test(row.cnpj) ||
                   regex.test(JSON.stringify(row.data));
        });
        return this;
    }

    order(column, { ascending = true } = {}) {
        this.orders.push((a, b) => {
            if (a[column] < b[column]) return ascending ? -1 : 1;
            if (a[column] > b[column]) return ascending ? 1 : -1;
            return 0;
        });
        return this;
    }

    limit(count) {
        this.limitVal = count;
        return this;
    }

    async insert(data) {
        // Simulate Network Latency
        await new Promise(r => setTimeout(r, 100));

        const rows = Array.isArray(data) ? data : [data];
        const newRows = rows.map(r => ({
            ...r,
            id: r.id || crypto.randomUUID(),
            created_at: new Date().toISOString()
        }));

        if (!this.client.db[this.table]) this.client.db[this.table] = [];
        this.client.db[this.table].push(...newRows);
        this.client._saveDB();

        // Return object structure matching real Supabase insert response
        return { data: newRows, error: null };
    }

    async update(data) {
        // Requires filter to be set usually, simple mock applies to filtered
        // This is a simplified "execute" step for updates
        // Simulate Network Latency
        await new Promise(r => setTimeout(r, 100));
        return this._execute('update', data);
    }

    async then(resolve, reject) {
        // Make the builder awaitable (execute the query)
        const res = await this._execute('select');
        if (res.error) reject(res.error);
        else resolve(res);
    }

    async _execute(action, updateData = null) {
        // Simulate Network Latency
        await new Promise(r => setTimeout(r, 300)); // 300ms latency

        let rows = this.client.db[this.table] || [];

        // Apply filters
        let result = rows.filter(row => this.filters.every(f => f(row)));

        if (action === 'select') {
            // Sort
            this.orders.forEach(sortFn => result.sort(sortFn));
            // Limit
            if (this.limitVal) result = result.slice(0, this.limitVal);
            return { data: result, error: null };
        }

        if (action === 'update') {
            // Update the actual DB references
            let count = 0;
            rows.forEach(row => {
                if (this.filters.every(f => f(row))) {
                    Object.assign(row, updateData);
                    count++;
                }
            });
            this.client._saveDB();
            return { count, error: null };
        }
    }
}

// Global Instance
window.supabase = new MockSupabase();
console.log("⚡ Supabase Mock Client Initialized");
