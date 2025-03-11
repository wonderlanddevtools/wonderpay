"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EntitySignupPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    entityName: '',
    contactFirstName: '',
    contactLastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    businessType: '',
    industry: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreed) {
      alert("Please agree to the WonderPay terms and conditions");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format data for Monite API - must match exactly what the API expects
      const entityData = {
        name: formData.entityName, // Required by Monite API
        type: "organization",
        email: formData.email,
        tax_id: "123456789", // This would be collected in a real form
        phone: formData.phone,
        address: {
          country: formData.country,
          city: formData.city,
          postal_code: formData.postalCode,
          line1: formData.address,
          state: formData.state,
        },
        organization: {
          legal_name: formData.entityName,
          business_structure: formData.businessType || "private_corporation",
        }
      };

      // Send entity data to Monite API through our backend
      const response = await fetch('/api/monite/entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...entityData,
          // Include user data for our own authentication system
          userData: {
            email: formData.email,
            password: formData.password,
            firstName: formData.contactFirstName,
            lastName: formData.contactLastName
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create entity');
      }
      
      const result: { id: string; type: string; email: string } = await response.json();
      console.log("Entity created:", result);
      
      // Redirect to dashboard or confirmation page
      router.push('/dashboard');
    } catch (error) {
      console.error("Error creating entity:", error);
      alert("There was an error creating your entity. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-1">Entity Sign-Up Details</h1>
      <p className="text-gray-600 mb-8">
        Please provide your organization or personal details to create an
        account with WonderPay
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Entity Name */}
        <div>
          <label htmlFor="entityName" className="block text-sm font-medium text-gray-700 mb-1">
            Entity Name
          </label>
          <input
            type="text"
            id="entityName"
            name="entityName"
            value={formData.entityName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., Jazz Entertainment Group"
            required
          />
        </div>
        
        {/* Contact Person */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contactFirstName" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person First Name
            </label>
            <input
              type="text"
              id="contactFirstName"
              name="contactFirstName"
              value={formData.contactFirstName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="contactLastName" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person Last Name
            </label>
            <input
              type="text"
              id="contactLastName"
              name="contactLastName"
              value={formData.contactLastName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>
        
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., contact@jazzgroup.com"
            required
          />
        </div>
        
        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Create a secure password"
            minLength={8}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
        </div>
        
        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Confirm your password"
            minLength={8}
            required
          />
        </div>
        
        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="+1 234 567 8901"
            required
          />
        </div>
        
        {/* Business Type */}
        <div>
          <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
            Business Type
          </label>
          <select
            id="businessType"
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select business type</option>
            <option value="private_corporation">Private Corporation</option>
            <option value="public_corporation">Public Corporation</option>
            <option value="single_member_llc">Single Member LLC</option>
            <option value="multi_member_llc">Multi-Member LLC</option>
            <option value="incorporated_partnership">Incorporated Partnership</option>
            <option value="private_partnership">Private Partnership</option>
            <option value="public_partnership">Public Partnership</option>
            <option value="unincorporated_partnership">Unincorporated Partnership</option>
            <option value="sole_proprietorship">Sole Proprietorship</option>
            <option value="unincorporated_association">Unincorporated Association</option>
          </select>
        </div>
        
        {/* Industry */}
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
            Industry
          </label>
          <select
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select industry</option>
            <option value="music">Music</option>
            <option value="entertainment">Entertainment</option>
            <option value="hospitality">Hospitality</option>
            <option value="luxury">Luxury</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        {/* Business Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Business Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        {/* State/Province and Postal Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select state</option>
              <option value="AL">Alabama</option>
              <option value="AK">Alaska</option>
              <option value="AZ">Arizona</option>
              <option value="CA">California</option>
              <option value="CO">Colorado</option>
              <option value="CT">Connecticut</option>
              <option value="FL">Florida</option>
              <option value="GA">Georgia</option>
              <option value="NY">New York</option>
              <option value="TX">Texas</option>
              {/* Add more states as needed */}
            </select>
          </div>
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>
        
        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            {/* Add more countries as needed */}
          </select>
        </div>
        
        {/* Terms and Conditions */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="terms"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            required
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            I agree to the WonderPay terms and conditions
          </label>
        </div>
        
        {/* Submit buttons */}
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
