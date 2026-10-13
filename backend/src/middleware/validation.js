function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
}

function isValidPhone(phone) {
    if (!phone) return false;
    const clean = String(phone).replace(/\D/g, '').slice(-10);
    return /^[6-9]\d{9}$/.test(clean);
}

function isValidPassword(password) {
    if (!password || typeof password !== 'string') return false;
    // At least 8 characters, at least 1 digit or symbol
    return password.length >= 8 && /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
}

function validatePatientRegistration(req, res, next) {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    if (!fullName || !fullName.trim()) {
        return res.status(400).json({ error: 'Full name is required.' });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!isValidPhone(phone)) {
        return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }
    if (!isValidPassword(password)) {
        return res.status(400).json({
            error: 'Password must be at least 8 characters long and contain at least one digit or symbol.'
        });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
    }

    req.cleanBody = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: String(phone).replace(/\D/g, '').slice(-10),
        password
    };
    next();
}

function validateDoctorRegistration(req, res, next) {
    const {
        fullName,
        email,
        phone,
        specialization,
        qualifications,
        experienceYears,
        hospitalId,
        password,
        confirmPassword
    } = req.body;

    if (!fullName || !fullName.trim()) {
        return res.status(400).json({ error: 'Doctor full name is required.' });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!isValidPhone(phone)) {
        return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }
    if (!specialization || !specialization.trim()) {
        return res.status(400).json({ error: 'Medical specialization is required.' });
    }
    if (!qualifications || !qualifications.trim()) {
        return res.status(400).json({ error: 'Qualifications (e.g. MBBS, MD, MS) are required.' });
    }
    if (!isValidPassword(password)) {
        return res.status(400).json({
            error: 'Password must be at least 8 characters long and contain at least one digit or symbol.'
        });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
    }

    req.cleanBody = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: String(phone).replace(/\D/g, '').slice(-10),
        specialization: specialization.trim(),
        qualifications: qualifications.trim(),
        experienceYears: parseInt(experienceYears || 0, 10),
        hospitalId: (hospitalId || 'GH_BHIMAVARAM').trim(),
        password
    };
    next();
}

function validateLoginInput(req, res, next) {
    const { email, password } = req.body;
    if (!email || !email.trim() || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }
    req.cleanBody = {
        email: email.trim().toLowerCase(),
        password
    };
    next();
}

module.exports = {
    isValidEmail,
    isValidPhone,
    isValidPassword,
    validatePatientRegistration,
    validateDoctorRegistration,
    validateLoginInput
};
