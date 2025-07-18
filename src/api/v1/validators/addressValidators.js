const validateAddressData = addressData => {
  const errors = [];

  if (!addressData || typeof addressData !== 'object') {
    return {
      isValid: false,
      errors: ['Address data must be a valid object']
    };
  }

  // Required fields validation
  const requiredFields = [
    { field: 'address', label: 'Address' },
    { field: 'city', label: 'City' },
    { field: 'state', label: 'State' },
    { field: 'country', label: 'Country' },
    { field: 'zipCode', label: 'Zip Code' },
    { field: 'district', label: 'District' }
  ];

  requiredFields.forEach(({ field, label }) => {
    if (
      !addressData[field] ||
      typeof addressData[field] !== 'string' ||
      addressData[field].trim() === ''
    ) {
      errors.push(`${label} is required and must be a non-empty string`);
    }
  });

  // Field length validations
  if (addressData.address && addressData.address.length > 255) {
    errors.push('Address must not exceed 255 characters');
  }

  if (addressData.city && addressData.city.length > 100) {
    errors.push('City must not exceed 100 characters');
  }

  if (addressData.state && addressData.state.length > 100) {
    errors.push('State must not exceed 100 characters');
  }

  if (addressData.country && addressData.country.length > 100) {
    errors.push('Country must not exceed 100 characters');
  }

  if (addressData.district && addressData.district.length > 100) {
    errors.push('District must not exceed 100 characters');
  }

  if (addressData.zipCode && addressData.zipCode.length > 20) {
    errors.push('Zip code must not exceed 20 characters');
  }

  // Format validations
  if (addressData.zipCode && !/^[a-zA-Z0-9\s-]+$/.test(addressData.zipCode)) {
    errors.push(
      'Zip code can only contain letters, numbers, spaces, and hyphens'
    );
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    message: errors.length > 0 ? errors.join(', ') : null
  };
};

const validateAddressUpdate = addressData => {
  return validateAddressData(addressData);
};

module.exports = {
  validateAddressData,
  validateAddressUpdate
};
