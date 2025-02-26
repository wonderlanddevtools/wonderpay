"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Entity {
  id: string;
  name: string;
  email?: string;
  created_at: string;
}

export default function DashboardPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEntityName, setNewEntityName] = useState("");
  const [creating, setCreating] = useState(false);

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
    
    if (!newEntityName.trim()) {
      setError("Entity name is required");
      return;
    }
    
    try {
      setCreating(true);
      setError(null);
      
      const response = await fetch("/api/monite/entities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newEntityName,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create entity");
      }
      
      setNewEntityName("");
      await fetchEntities();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error creating entity:", err);
    } finally {
      setCreating(false);
    }
  };

  // Fetch entities on component mount
  useEffect(() => {
    fetchEntities();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">WonderPay Dashboard</h1>
      
      {/* Create Entity Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Entity</h2>
        
        <form onSubmit={createEntity} className="space-y-4">
          <div>
            <label htmlFor="entityName" className="block text-sm font-medium text-gray-700 mb-1">
              Entity Name
            </label>
            <input
              id="entityName"
              type="text"
              value={newEntityName}
              onChange={(e) => setNewEntityName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter entity name"
              disabled={creating}
            />
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={creating || !newEntityName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition"
          >
            {creating ? "Creating..." : "Create Entity"}
          </button>
        </form>
      </div>
      
      {/* Entities List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Entities</h2>
        
        {loading ? (
          <div className="text-center py-4">Loading entities...</div>
        ) : entities.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No entities found. Create one above!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
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
                      {entity.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entity.email || "-"}
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
