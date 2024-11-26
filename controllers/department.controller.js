import axios from "axios";

const buildHierarchy = (items, parentId = "1") => {
    return items
        .filter(item => item.PARENT === parentId)
        .map(item => ({
            ...item,
            children: buildHierarchy(items, item.ID), // Recursively find children
        }));
};

const getAllDepartments = async (req, res) => {
    try {
        const response = await axios.get(`${process.env.ROOT_URL}/department.get`, {
            params: {
                auth: req.body.access_token,
            },
        });

        const departments = response.data.result;

        const hierarchy = buildHierarchy(departments);

        res.send(hierarchy); // Send the hierarchical structure as a response
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export {getAllDepartments}
