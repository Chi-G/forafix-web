export const detectCardBrand = (number: string): string => {
    const n = number.replace(/\s/g, '');
    if (/^4/.test(n)) return 'Visa';
    if (/^5[1-5]/.test(n)) return 'Mastercard';
    if (/^506[0-1]|^507[8-9]|^6500/.test(n)) return 'Verve';
    return 'Unknown';
};

export const validateCardNumber = (number: string): boolean => {
    const n = number.replace(/\s/g, '');
    return n.length >= 13 && n.length <= 19 && /^\d+$/.test(n);
};

export const validateExpiry = (expiry: string): boolean => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    const [m, y] = expiry.split('/').map(Number);
    if (m < 1 || m > 12) return false;
    const now = new Date();
    const curY = now.getFullYear() % 100;
    const curM = now.getMonth() + 1;
    return y > curY || (y === curY && m >= curM);
};

export const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    for (let i = 0; i < v.length; i += 4) {
        parts.push(v.substring(i, i + 4));
    }
    return parts.length > 0 ? parts.join(' ') : v;
};

export const formatExpiry = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
        return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
};

export const validateCardName = (name: string): boolean => {
    const re = /^[a-zA-Z]{2,}(?:\s+[a-zA-Z]{2,})+$/;
    return re.test(name.trim());
};
