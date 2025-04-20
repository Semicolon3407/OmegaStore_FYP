import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  AlertCircle,
  Loader2,
} from "lucide-react";

const TrackOrder = () => {
  const { trackingNumber } = useParams();
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrackingInfo = async () => {
      try {
        const response = await axios.get(
          `/api/tracking/${trackingNumber}`,
          { withCredentials: true }
        );
        setTrackingInfo(response.data);
        setError(null);
      } catch (err) {
        setError("Unable to fetch tracking information");
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingInfo();
  }, [trackingNumber]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Order Placed":
        return <Package className="w-6 h-6 text-blue-900" />;
      case "Order Confirmed":
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case "Processing":
        return <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />;
      case "Picked Up":
        return <Truck className="w-6 h-6 text-purple-500" />;
      case "In Transit":
        return <Truck className="w-6 h-6 text-blue-500" />;
      case "Out for Delivery":
        return <Truck className="w-6 h-6 text-orange-500" />;
      case "Delivered":
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case "Failed Delivery":
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Package className="w-6 h-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-900 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error || !trackingInfo) {
    return (
      <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full mx-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
            {error || "Tracking information not found"}
          </h2>
          <p className="text-gray-600 text-center">
            Please check your tracking number or try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-2">
            Track Your Order
          </h1>
          <p className="text-gray-600 mb-8">
            Tracking Number: {trackingNumber}
          </p>

          {/* Status Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              {trackingInfo.location?.history?.map((update, index) => (
                <div key={index} className="relative pl-12 pb-8">
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white border-2 border-blue-900 flex items-center justify-center">
                    {getStatusIcon(update.status)}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{update.status}</h3>
                        <p className="text-gray-600 text-sm">
                          {update.city}, {update.state}
                        </p>
                      </div>
                      <span className="text-gray-500 text-sm">
                        {new Date(update.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-900" />
                Current Location
              </h2>
              {trackingInfo.location?.current ? (
                <>
                  <p className="text-gray-800">
                    {trackingInfo.location.current.city},{" "}
                    {trackingInfo.location.current.state}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Last Updated:{" "}
                    {new Date(trackingInfo.location.current.timestamp).toLocaleString()}
                  </p>
                </>
              ) : (
                <p className="text-gray-500">Location information not available</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-900" />
                Delivery Information
              </h2>
              {trackingInfo.estimatedDelivery ? (
                <p className="text-gray-800">
                  Estimated Delivery:{" "}
                  {new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-gray-500">Estimated delivery date not available</p>
              )}
              {trackingInfo.actualDelivery && (
                <p className="text-gray-800 mt-2">
                  Actual Delivery:{" "}
                  {new Date(trackingInfo.actualDelivery).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Updates */}
          {trackingInfo.notes?.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Updates
              </h2>
              <div className="space-y-4">
                {trackingInfo.notes.map((note, index) => (
                  <div key={index} className="border-l-2 border-blue-900 pl-4">
                    <p className="text-gray-800">{note.message}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(note.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackOrder; 