const SecurityManager = {
    currentUser: null,
    secretKey: "vendas-ia-secret-key-mock", // In production, this would be backend-managed

    // 1. Mock Authentication & Multi-Tenancy
    login: (username, role) => {
        const orgId = role === 'admin' ? 'org_hq' : 'org_branch_01'; // Simulate Tenant
        // Pillar 1 - Item 1: Multi-Tenant Architecture (Simulated via OrgID)
        SecurityManager.currentUser = {
            id: 'user_' + Math.random().toString(36).substr(2, 9),
            name: username,
            role: role,
            orgId: orgId
        };
        SecurityManager.logAction('LOGIN_ATTEMPT', `User ${username} attempting login as ${role}`);
        return SecurityManager.currentUser;
    },

    // Pillar 1 - Item 2: Auth0 / Firebase Auth with 2FA (Simulated)
    verify2FA: (code) => {
        if (code === '123456') {
            SecurityManager.logAction('LOGIN_SUCCESS', `User ${SecurityManager.currentUser.name} passed 2FA`);
            return true;
        }
        SecurityManager.logAction('LOGIN_FAILURE', `User ${SecurityManager.currentUser.name} failed 2FA`);
        return false;
    },

    logout: () => {
        SecurityManager.logAction('LOGOUT', `User ${SecurityManager.currentUser?.name} logged out`);
        SecurityManager.currentUser = null;
        location.reload();
    },

    // 2. Encryption (Simulated AES via Base64 + Salt for demo)
    // "Pillar 1 - Item 6: End-to-End Encryption"
    encrypt: (text) => {
        if (!text) return text;
        if (typeof text !== 'string') return text;
        if (text.startsWith("ENC_")) return text; // Already encrypted
        // Simple obfuscation for client-side demo.
        // Real implementation would use window.crypto.subtle
        return "ENC_" + btoa(text + "||" + SecurityManager.secretKey);
    },

    decrypt: (text) => {
        if (!text) return text;
        if (typeof text !== 'string') return text;
        if (!text.startsWith("ENC_")) return text;
        try {
            const decoded = atob(text.replace("ENC_", ""));
            return decoded.split("||")[0];
        } catch (e) {
            console.error("Decryption failed", e);
            return text;
        }
    },

    // 3. Audit Logs
    // "Pillar 1 - Item 5: Audit Logs"
    logAction: (action, details) => {
        const logs = JSON.parse(localStorage.getItem('vendasIA_audit_logs') || '[]');
        const newLog = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            user: SecurityManager.currentUser ? SecurityManager.currentUser.name : 'System',
            role: SecurityManager.currentUser ? SecurityManager.currentUser.role : 'System',
            orgId: SecurityManager.currentUser ? SecurityManager.currentUser.orgId : 'System',
            action,
            details
        };
        logs.unshift(newLog);
        // Keep only last 1000 logs
        if (logs.length > 1000) logs.pop();
        localStorage.setItem('vendasIA_audit_logs', JSON.stringify(logs));
        console.log(`[AUDIT] ${action}: ${details}`);
    },

    getAuditLogs: () => {
        if (!SecurityManager.hasPermission('admin')) return [];
        return JSON.parse(localStorage.getItem('vendasIA_audit_logs') || '[]');
    },

    // 4. RBAC (Role-Based Access Control)
    // "Pillar 1 - Item 3: RBAC"
    hasPermission: (requiredRole) => {
        if (!SecurityManager.currentUser) return false;
        if (SecurityManager.currentUser.role === 'admin') return true;
        return SecurityManager.currentUser.role === requiredRole;
    },

    // Pillar 1 - Item 4: API Gateway (Reverse Proxy Simulation)
    secureFetch: async (url, options) => {
        // Gateway Logic: Check Authentication
        if (!SecurityManager.currentUser) {
            SecurityManager.logAction('GATEWAY_BLOCK', `Unauthenticated access attempt to ${url}`);
            throw new Error("API Gateway: Access Denied (Unauthenticated)");
        }

        // Gateway Logic: Rate Limiting / Logging
        SecurityManager.logAction('GATEWAY_REQUEST', `Proxying request to ${url} for Org ${SecurityManager.currentUser.orgId}`);

        // Gateway Logic: Forward Request (In real world, this would inject server-side secrets)
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                 SecurityManager.captureException(new Error(`API Error: ${response.statusText}`), { url });
            }
            return response;
        } catch (error) {
            SecurityManager.captureException(error, { url });
            throw error;
        }
    },

    // 5. Global Error Monitoring (Mock Sentry)
    // "Pillar 1 - Item 9: Error Monitoring"
    captureException: (error, context = {}) => {
        const errorLog = {
            message: error.message || error,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            user: SecurityManager.currentUser
        };
        console.error("SecurityManager Caught Exception:", errorLog);
        // In real app: send to Sentry DSN
        SecurityManager.logAction('ERROR', `Exception: ${error.message}`);
    },

    // 6. LGPD Compliance
    // "Pillar 1 - Item 10: Automated Compliance"
    forgetData: (targetEmail) => {
        if (!SecurityManager.hasPermission('admin')) throw new Error("Permission Denied");

        let count = 0;
        const groups = JSON.parse(localStorage.getItem('vendasIA_groups') || '[]');

        groups.forEach(group => {
            // Check primary email
            const decryptedEmail = SecurityManager.decrypt(group.primaryEmail);
            if (decryptedEmail === targetEmail) {
                group.primaryEmail = "ANONYMIZED_LGPD";
                group.mainPhone = "ANONYMIZED_LGPD";
                group.enrichmentData = null;
                count++;
            }
            // Check decision makers
            if (group.decisionMakers) {
                 // Logic to clean contacts would go here
            }
        });

        localStorage.setItem('vendasIA_groups', JSON.stringify(groups));
        SecurityManager.logAction('LGPD_FORGET', `Anonymized data for ${targetEmail}. Records affected: ${count}`);
        return count;
    }
};

// Global Error Handler
window.onerror = function(message, source, lineno, colno, error) {
    SecurityManager.captureException(error || message, { source, lineno });
};
