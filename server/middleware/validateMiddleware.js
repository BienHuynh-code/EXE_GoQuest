/**
 * Simple validation helper to check required fields and formats
 * @param {Object} schema - Object describing the validation rules
 * @returns {Function} middleware
 */
const validate = (schema) => (req, res, next) => {
    const { body } = req;
    const errors = [];

    Object.keys(schema).forEach(field => {
        const rules = schema[field];
        const value = body[field];

        // Required check
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`${field} là bắt buộc`);
            return;
        }

        if (value !== undefined && value !== null && value !== '') {
            // Min length
            if (rules.minLength && value.length < rules.minLength) {
                errors.push(`${field} phải có ít nhất ${rules.minLength} ký tự`);
            }

            // Email format
            if (rules.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errors.push(`${field} không đúng định dạng email`);
            }

            // Numeric check
            if (rules.isNumeric && isNaN(Number(value))) {
                errors.push(`${field} phải là số`);
            }
        }
    });

    if (errors.length > 0) {
        return res.status(400).json({ message: errors[0], allErrors: errors });
    }

    next();
};

module.exports = validate;
