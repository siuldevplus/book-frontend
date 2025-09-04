document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:3300/api/books";

    // Seleccionar los elementos del DOM
    const form = document.getElementById("book-form");
    const tableBody = document.getElementById("books-table-body");
    const bookIdInput = document.getElementById("book-id");
    const submitButton = document.getElementById("submit-button");
    const cancelButton = document.getElementById("cancel-button");

    // Ocultar el botón de cancelar al inicio
    cancelButton.style.display = "none";

    /**
     * FUNCIÓN PARA OBTENER Y MOSTRAR TODOS LOS LIBROS
     */
    const fetchBooks = async () => {
        try {
            const response = await fetch(API_URL);
            const result = await response.json();

            tableBody.innerHTML = ""; // Limpiar tabla

            if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
                const row = `<tr><td colspan="7" style="text-align:center;">No hay libros registrados</td></tr>`;
                tableBody.innerHTML = row;
                return;
            }

            // CORRECCIÓN: Se cambió result.data.array.forEach por result.data.forEach
            result.data.forEach((book) => {
                const row = `
                    <tr>
                        <td>${book.code}</td>
                        <td>${book.title}</td>
                        <td>${book.author}</td>
                        <td>$${book.price}</td>
                        <td>${book.format}</td>
                        <td>${book.rating} ⭐</td>
                        <td class="action-buttons">
                            <button class="edit-btn" data-id="${book.id}">Editar</button>
                            <button class="delete-btn" data-id="${book.id}">Eliminar</button>
                        </td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML("beforeend", row);
            });
        } catch (error) {
            console.error("Error al obtener los libros:", error);
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Error al cargar los datos</td></tr>`;
        }
    };

    /**
     * FUNCIÓN PARA LIMPIAR EL FORMULARIO
     */
    const resetForm = () => {
        form.reset();
        bookIdInput.value = "";
        submitButton.textContent = "Agregar libro";
        cancelButton.style.display = "none";
    };

    /**
     * EVENT LISTENER PARA CREAR Y ACTUALIZAR UN LIBRO
     */
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // CORRECCIÓN: Se crea un objeto JS en lugar de FormData
        const bookData = {
            code: document.getElementById("code").value,
            title: document.getElementById("title").value,
            author: document.getElementById("author").value, // Asegúrate que el ID en HTML sea "author"
            price: document.getElementById("price").value,
            format: document.getElementById("format").value,
            rating: document.getElementById("rating").value,
            description: document.getElementById("description").value || null,
        };

        const bookId = bookIdInput.value;
        const method = bookId ? "PUT" : "POST";
        const url = bookId ? `${API_URL}/${bookId}` : API_URL;

        try {
            // CORRECCIÓN: Se añaden headers y se usa JSON.stringify
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bookData),
            });

            const result = await response.json();
            alert(result.message);

            if (result.status) {
                resetForm();
                fetchBooks(); // Recargar la tabla
            }
        } catch (error) {
            console.error("Error al guardar libro:", error);
            alert("Ocurrió un error al guardar el libro.");
        }
    });
    
    /**
     * EVENT LISTENER PARA LOS BOTONES DE EDITAR Y ELIMINAR (usando delegación de eventos)
     */
    tableBody.addEventListener("click", async (e) => {
        // --- LÓGICA DE ELIMINAR ---
        if (e.target.classList.contains("delete-btn")) {
            const bookId = e.target.getAttribute("data-id");
            if (confirm("¿Estás seguro de que quieres eliminar este libro?")) {
                try {
                    const response = await fetch(`${API_URL}/${bookId}`, {
                        method: "DELETE",
                    });
                    const result = await response.json();
                    alert(result.message);
                    if (result.status) {
                        fetchBooks(); // Recargar la tabla
                    }
                } catch (error) {
                    console.error("Error al eliminar el libro:", error);
                    alert("Ocurrió un error al eliminar el libro.");
                }
            }
        }

        // --- LÓGICA DE EDITAR ---
        if (e.target.classList.contains("edit-btn")) {
            const bookId = e.target.getAttribute("data-id");
            try {
                const response = await fetch(`${API_URL}/${bookId}`);
                const result = await response.json();

                if (result.status && result.data) {
                    const book = result.data;
                    // Llenar el formulario con los datos del libro
                    bookIdInput.value = book.id;
                    document.getElementById("code").value = book.code;
                    document.getElementById("title").value = book.title;
                    document.getElementById("author").value = book.author;
                    document.getElementById("price").value = book.price;
                    document.getElementById("format").value = book.format;
                    document.getElementById("rating").value = book.rating;
                    document.getElementById("description").value = book.description;
                    
                    // Actualizar UI para modo edición
                    submitButton.textContent = "Actualizar libro";
                    cancelButton.style.display = "inline-block";
                    window.scrollTo(0, 0); // Lleva la vista al inicio de la página
                } else {
                    alert(result.message);
                }
            } catch (error) {
                 console.error("Error al obtener datos para editar:", error);
                 alert("Ocurrió un error al obtener los datos del libro.");
            }
        }
    });

    /**
     * EVENT LISTENER PARA EL BOTÓN DE CANCELAR EDICIÓN
     */
    cancelButton.addEventListener('click', () => {
        resetForm();
    });

    // Carga inicial de los libros
    fetchBooks();
});