import { useState } from "react";
import { uploadImageToCloudinary } from "../services/cloudinary";

const ProjectForm = ({ onSubmit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Upload image to Cloudinary
      let imageUrl = "";
      if (image) {
        imageUrl = await uploadImageToCloudinary(image);
      }

      const projectData = {
        title,
        description,
        imageUrl,
        createdAt: new Date(),
      };

      onSubmit(projectData);

      // Reset form
      setTitle("");
      setDescription("");
      setImage(null);
      alert("Project added successfully!");
    } catch (error) {
      console.error(error);
      alert("Error uploading project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Add New Project</h2>

      <input
        type="text"
        placeholder="Project Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
        required
      />

      <textarea
        placeholder="Project Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
        required
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        className="w-full mb-3"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Uploading..." : "Add Project"}
      </button>
    </form>
  );
};

export default ProjectForm;