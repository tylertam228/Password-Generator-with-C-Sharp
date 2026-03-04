using PasswordGenerator.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
// Add the PasswordGeneratorService to the container as a singleton
builder.Services.AddSingleton<PasswordGeneratorService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

// Use HTTPS redirection
app.UseHttpsRedirection();
// Use routing
app.UseRouting();
// Use authorization
app.UseAuthorization();
// Map static assets
app.MapStaticAssets();
// Map Razor pages
app.MapRazorPages()
   .WithStaticAssets();

// Map the POST request to the /api/generate endpoint
app.MapPost("/api/generate", (PasswordOptions options, PasswordGeneratorService service) =>
{
    try
    {
        var result = service.Generate(options); // Generate the password
        return Results.Ok(result);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new { error = ex.Message }); // Return a bad request response with the error message
    }
});

app.Run();
