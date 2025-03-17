"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { GlowButton } from "@/components/ui/glow-button";
import { Search, Plus, Users, Building2, FileText, Loader2 } from "lucide-react";
import { ContactCard } from "@/components/ui/contact-card";
import { useEntities } from "~/hooks/useEntities";

// Type definitions for the form
interface EntityFormData {
  name: string;
  type: "organization" | "individual";
  email: string;
  tax_id: string;
  phone?: string;
  website?: string;
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
  userData?: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  };
}

export default function ClientsVendorsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [entityType, setEntityType] = useState<"organization" | "individual">("organization");
  const [createUserAccount, setCreateUserAccount] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Use our custom hook for entities operations
  const {
    entities,
    filteredEntities,
    isLoading,
    isError,
    error,
    searchTerm,
    setSearchTerm,
    createEntity,
    isCreating,
    getEntityDisplayName,
    formatDate
  } = useEntities();
  
  // Handle form submission
  const handleSubmitEntity = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formRef.current) return;
    
    const formData = new FormData(formRef.current);
    const entityData: Partial<EntityFormData> = {
      name: formData.get("name") as string,
      type: formData.get("type") as "organization" | "individual",
      email: formData.get("email") as string,
      tax_id: formData.get("tax_id") as string,
      phone: formData.get("phone") as string || undefined,
      website: formData.get("website") as string || undefined,
      address: {
        country: formData.get("country") as string,
        city: formData.get("city") as string,
        postal_code: formData.get("postal_code") as string,
        line1: formData.get("line1") as string,
        state: formData.get("state") as string || undefined,
      }
    };
    
    // Add organization or individual data based on type
    if (entityData.type === "organization") {
      entityData.organization = {
        legal_name: formData.get("legal_name") as string,
      };
    } else {
      entityData.individual = {
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
      };
    }
    
    // Add user data if creating a user account
    if (createUserAccount) {
      entityData.userData = {
        email: formData.get("user_email") as string,
        password: formData.get("password") as string,
        firstName: formData.get("first_name") as string || undefined,
        lastName: formData.get("last_name") as string || undefined,
      };
    }
    
    // Call the mutation function from our hook
    createEntity(entityData as any);
    
    // Reset the form and hide it
    setShowCreateForm(false);
    formRef.current.reset();
  };
  
  // Calculate statistics
  const totalEntities = entities.length;
  const organizationCount = entities.filter(entity => entity.type === "organization").length;
  const individualCount = entities.filter(entity => entity.type === "individual").length;
  
  return (
    <div className="space-y-8">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clients & Vendors</h1>
        <div className="flex gap-3">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search clients & vendors..."
            />
          </div>
          <GlowButton 
            onClick={() => setShowCreateForm(!showCreateForm)} 
            className="flex items-center"
            glowColors={['#3B82F6', '#60A5FA']}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </GlowButton>
        </div>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Contacts" 
          value={totalEntities.toString()}
          icon={<Users className="h-6 w-6 text-blue-500" />}
          description="All clients and vendors"
        />
        <StatCard 
          title="Organizations" 
          value={organizationCount.toString()}
          icon={<Building2 className="h-6 w-6 text-blue-500" />}
          description="Company entities"
        />
        <StatCard 
          title="Individuals" 
          value={individualCount.toString()}
          icon={<FileText className="h-6 w-6 text-blue-500" />}
          description="Individual contacts"
        />
      </div>
      
      {/* Show create form if enabled */}
      {showCreateForm && (
        <Card className="p-6 mb-6 border border-blue-200 bg-blue-50">
          <h2 className="text-xl font-bold mb-4">Add New Client/Vendor</h2>
          <form ref={formRef} onSubmit={handleSubmitEntity}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="organization"
                    checked={entityType === "organization"}
                    onChange={() => setEntityType("organization")}
                    className="form-radio h-4 w-4 text-blue-600"
                    required
                  />
                  <span className="ml-2">Organization</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="individual"
                    checked={entityType === "individual"}
                    onChange={() => setEntityType("individual")}
                    className="form-radio h-4 w-4 text-blue-600"
                    required
                  />
                  <span className="ml-2">Individual</span>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Organization/Individual specific fields */}
              {entityType === "organization" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Legal Name</label>
                    <input
                      type="text"
                      name="legal_name"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Company, Inc."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Display Name</label>
                    <input
                      type="text"
                      name="name"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Common name (if different)"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Smith"
                      required
                    />
                  </div>
                  <input
                    type="hidden"
                    name="name"
                    value={`Contact ${new Date().toISOString()}`}
                  />
                </>
              )}
              
              {/* Common fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="contact@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                <input
                  type="text"
                  name="tax_id"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Tax ID number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone (optional)</label>
                <input
                  type="tel"
                  name="phone"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Website (optional)</label>
                <input
                  type="url"
                  name="website"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://example.com"
                />
              </div>
              
              {/* Address fields */}
              <div className="col-span-2">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                      type="text"
                      name="country"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="US"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      name="city"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="San Francisco"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State (optional)</label>
                    <input
                      type="text"
                      name="state"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="CA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                    <input
                      type="text"
                      name="postal_code"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="94103"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Street Address</label>
                    <input
                      type="text"
                      name="line1"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="123 Main St"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* User account section */}
              <div className="col-span-2 border-t pt-4 mt-2">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="create_user"
                    checked={createUserAccount}
                    onChange={() => setCreateUserAccount(!createUserAccount)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="create_user" className="ml-2 block text-sm text-gray-900">
                    Create user account for this entity
                  </label>
                </div>
                
                {createUserAccount && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-blue-100">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">User Email</label>
                      <input
                        type="email"
                        name="user_email"
                        defaultValue={(entityType === "individual" || !entityType) ? 
                          (formRef.current?.querySelector<HTMLInputElement>('input[name="email"]')?.value || "") : ""}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="user@example.com"
                        required={createUserAccount}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <input
                        type="password"
                        name="password"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Secure password"
                        required={createUserAccount}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowCreateForm(false)} 
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <GlowButton
                type="submit"
                disabled={isCreating}
                glowColors={['#3B82F6', '#60A5FA']}
              >
                {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Create {entityType === "organization" ? "Organization" : "Individual"}
              </GlowButton>
            </div>
          </form>
        </Card>
      )}
      
      {/* Entities list */}
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-600">Loading entities...</span>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-red-500 bg-white rounded-lg shadow">
            <p>Error loading entities: {error?.message ?? "Unknown error"}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              Try again
            </button>
          </div>
        ) : filteredEntities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntities.map((entity) => (
              <ContactCard
                key={entity.id}
                title={getEntityDisplayName(entity)}
                subtitle={entity.type === "organization" ? "Organization" : "Individual"}
                email={entity.email}
                phone={entity.phone}
                address={`${entity.address.line1}, ${entity.address.city}, ${entity.address.state ?? ""} ${entity.address.postal_code}, ${entity.address.country}`}
                imageUrl={entity.type === "organization" ? "/company-placeholder.svg" : "/person-placeholder.svg"}
                tags={[entity.type]}
                link={`/dashboard/clients-vendors/${entity.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow">
            <p>No entities found. Add a new client or vendor to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
