"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Entity {
  id: string;
  type: string;
  email: string;
  tax_id: string;
  created_at: string;
  address: {
    country: string;
    city: string;
    postal_code: string;
    line1: string;
    state?: string;
  };
  organization?: {
    legal_name: string;
  };
  individual?: {
    first_name: string;
    last_name: string;
  };
}

interface EntityFormData {
  type: "organization" | "individual";
  email: string;
  tax_id: string;
  phone: string;
  website: string;
  address: {
    country: string;
    city: string;
    postal_code: string;
    line1: string;
    state: string;
  };
  organization?: {
    legal_name: string;
    business_structure: string;
  };
  individual?: {
    first_name: string;
    last_name: string;
  };
}

const initialFormData: EntityFormData = {
  type: "organization",
  email: "",
  tax_id: "",
  phone: "",
  website: "",
  address: {
    country: "US",
    city: "",
    postal_code: "",
    line1: "",
    state: "",
  },
  organization: {
    legal_name: "",
    business_structure: "private_corporation",
  },
};

export default function DashboardPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<EntityFormData>(initialFormData);
  const [showForm, setShowForm] = useState(false);

  // Fetch all entities
  const fetchEntities = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/monite/entities");
      
      if (!response.ok) {
        throw new Error("Failed to fetch entities");
      }
      
      const data = await response.json();
      setEntities(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching entities:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new entity
  const createEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setCreating(true);
      setError(null);
      
      // Create request data based on entity type
      const requestData = { ...formData };
      
      // Remove the unused type fields
      if (formData.type === "organization") {
        delete requestData.individual;
      } else {
        delete requestData.organization;
      }
      
      console.log("Creating entity with data:", requestData);
      
      const response = await fetch("/api/monite/entities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create entity");
      }
      
      // Reset form and close it
      setFormData(initialFormData);
      setShowForm(false);
      
      // Refresh the entities list
      await fetchEntities();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error creating entity:", err);
    } finally {
      setCreating(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes(".")) {
      // Handle nested fields
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }));
    } else {
      // Handle type change
      if (name === "type") {
        if (value === "organization") {
          setFormData(prev => ({
            ...prev,
            type: "organization" as const,
            organization: {
              legal_name: "",
              business_structure: "private_corporation",
            },
            individual: undefined,
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            type: "individual" as const,
            individual: {
              first_name: "",
              last_name: "",
            },
            organization: undefined,
          }));
        }
      } else {
        // Handle other top-level fields
        setFormData(prev => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  // Fetch entities on component mount
  useEffect(() => {
    fetchEntities();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      {/* Entity Creation Button */}
      {!showForm && (
        <div className="mb-8">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Create New Entity
          </button>
        </div>
      )}
      
      {/* Create Entity Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Create New Entity</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
          
          <form onSubmit={createEntity} className="space-y-4">
            {/* Entity Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entity Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="organization">Organization</option>
                <option value="individual">Individual</option>
              </select>
            </div>
            
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax ID
                </label>
                <input
                  type="text"
                  name="tax_id"
                  value={formData.tax_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tax ID (required)"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1234567890"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            
            {/* Address Information */}
            <div>
              <h3 className="text-lg font-medium mb-2">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="US, DE, GB, etc."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="State/Province"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="address.postal_code"
                    value={formData.address.postal_code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Postal Code"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    name="address.line1"
                    value={formData.address.line1}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Street Address"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Organization-specific fields */}
            {formData.type === "organization" && formData.organization && (
              <div>
                <h3 className="text-lg font-medium mb-2">Organization Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Legal Name
                    </label>
                    <input
                      type="text"
                      name="organization.legal_name"
                      value={formData.organization.legal_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Legal Company Name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Structure
                    </label>
                    <select
                      name="organization.business_structure"
                      value={formData.organization.business_structure}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="private_corporation">Private Corporation</option>
                      <option value="public_corporation">Public Corporation</option>
                      <option value="incorporated_partnership">Incorporated Partnership</option>
                      <option value="unincorporated_partnership">Unincorporated Partnership</option>
                      <option value="multi_member_llc">Multi-Member LLC</option>
                      <option value="single_member_llc">Single-Member LLC</option>
                      <option value="sole_proprietorship">Sole Proprietorship</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {/* Individual-specific fields */}
            {formData.type === "individual" && formData.individual && (
              <div>
                <h3 className="text-lg font-medium mb-2">Individual Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="individual.first_name"
                      value={formData.individual.first_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="First Name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="individual.last_name"
                      value={formData.individual.last_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Last Name"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition"
              >
                {creating ? "Creating..." : "Create Entity"}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Entities List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Entities</h2>
        
        {loading ? (
          <div className="text-center py-4">Loading entities...</div>
        ) : entities.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No entities found. Create one using the form above!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entities.map((entity) => (
                  <tr key={entity.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entity.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entity.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entity.type === "organization" && entity.organization
                        ? entity.organization.legal_name
                        : entity.type === "individual" && entity.individual
                        ? `${entity.individual.first_name} ${entity.individual.last_name}`
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entity.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(entity.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link
                        href={`/dashboard/entity/${entity.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
